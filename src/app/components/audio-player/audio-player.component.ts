import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { AudioService } from '../../services/audio.service';
import * as PlayerSelectors from '../../store/player/player.selectors';
import * as PlayerActions from '../../store/player/player.actions';
import { Track } from '../../models/track.model';
import { DurationPipe } from '../../pipes/duration.pipe';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSliderModule,
    MatButtonModule,
    MatProgressBarModule,
    DurationPipe,
  ],
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  currentTrack$: Observable<Track | null>;
  isPlaying$: Observable<boolean>;
  currentTime$: Observable<number>;
  volume$: Observable<number>;
  error$: Observable<string | null>;
  loadingState$: Observable<'loading' | 'error' | 'success'>;
  duration = 0;
  isMiniMode = false;
  previewTime: number | null = null;
  previewPosition = 0;
  showQueue = false;
  private destroy$ = new Subject<void>();
  private isDragging = false;
  playbackState$ = this.store.select(PlayerSelectors.selectPlaybackState);
  showTranscript = false;

  constructor(
    private store: Store,
    public audioService: AudioService,
  ) {
    this.currentTrack$ = this.store.select(PlayerSelectors.selectCurrentTrack)
      .pipe(takeUntil(this.destroy$));
    this.isPlaying$ = this.store.select(PlayerSelectors.selectIsPlaying)
      .pipe(takeUntil(this.destroy$));
    this.currentTime$ = this.store.select(PlayerSelectors.selectCurrentTime)
      .pipe(takeUntil(this.destroy$));
    this.volume$ = this.store.select(PlayerSelectors.selectVolume)
      .pipe(takeUntil(this.destroy$));
    this.error$ = this.store.select(PlayerSelectors.selectError);
    this.loadingState$ = this.store.select(PlayerSelectors.selectLoadingState);
  }

  ngOnInit() {
    this.currentTrack$
      .pipe(takeUntil(this.destroy$))
      .subscribe(track => {
        console.log('Current track:', track);
      });

    this.audioService.duration$
      .pipe(takeUntil(this.destroy$))
      .subscribe(duration => {
        this.duration = duration;
      });

    this.playbackState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        console.log('Playback state:', state);
      });

      this.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          console.error('Error:', error);
        }
      });
  }

  togglePlay() {
    this.isPlaying$
      .pipe(take(1))
      .subscribe(isPlaying => {
        if (isPlaying) {
          this.audioService.pause();
        } else {
          this.audioService.play();
        }
      });
  }

  seekTo(event: MouseEvent) {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const seekTime = this.duration * percentage;
    
    this.isDragging = true;
    this.store.dispatch(PlayerActions.setCurrentTime({ time: seekTime }));
    this.audioService.seek(seekTime);
  }

  onDragEnd(event: any) {
    this.isDragging = false;
    this.audioService.seek(event.value);
  }

  toggleMute() {
    this.volume$.pipe(take(1)).subscribe(volume => {
      const newVolume = volume > 0 ? 0 : 1;
      this.audioService.setVolume(newVolume);
      this.store.dispatch(PlayerActions.setVolume({ volume: newVolume }));
    });
  }

  setVolume(event: any) {
    const value = event.target?.value ?? event;
    const volume = Math.max(0, Math.min(1, value / 100));
    this.store.dispatch(PlayerActions.setVolume({ volume }));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.audioService.cleanup();
  }

  getFormattedTime(time: number | null): number {
    return time ?? 0;
  }

  getProgressPercentage(currentTime: number | null): number {
    return ((currentTime || 0) / (this.duration || 1)) * 100;
  }

  playPrevious() {
    this.store.dispatch(PlayerActions.playPrevious());
  }

  playNext() {
    this.store.dispatch(PlayerActions.playNext());
  }

  onVolumeChange(event: any) {
    const value = event.target?.value ?? event;
    const volume = Math.max(0, Math.min(1, value / 100));
    this.audioService.setVolume(volume);
    this.store.dispatch(PlayerActions.setVolume({ volume }));
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-cover.png';
  }
} 