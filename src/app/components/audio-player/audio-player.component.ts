import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
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
    MatIconModule,
    MatSliderModule,
    MatButtonModule,
    DurationPipe
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

  constructor(
    private store: Store,
    public audioService: AudioService
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
    this.audioService.duration$
      .pipe(takeUntil(this.destroy$))
      .subscribe(duration => {
        this.duration = duration;
      });
  }

  togglePlay() {
    this.isPlaying$.pipe(take(1)).subscribe(isPlaying => {
      if (isPlaying) {
        this.audioService.pause();
      } else {
        this.audioService.play();
      }
    });
  }

  seekTo(value: number) {
    this.isDragging = true;
    this.store.dispatch(PlayerActions.setCurrentTime({ time: value }));
  }

  onDragEnd(event: any) {
    this.isDragging = false;
    this.audioService.seek(event.value);
  }

  toggleMute() {
    this.volume$.pipe(take(1)).subscribe(volume => {
      this.setVolume(volume > 0 ? 0 : 100);
    });
  }

  setVolume(value: number) {
    this.audioService.setVolume(value / 100);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.audioService.cleanup();
  }
} 