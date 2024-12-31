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
  template: `
    <div class="player-container" [class.mini-mode]="isMiniMode">
      <ng-container *ngIf="currentTrack$ | async as track; else noTrack">
        <div class="now-playing">
          <img [src]="track.thumbnailUrl || 'assets/default-cover.png'" [alt]="track.title">
          <div class="track-info">
            <h3>{{ track.title }}</h3>
            <p>{{ track.artist }}</p>
            <p class="duration">
              {{ currentTime$ | async | duration }} / {{ track.duration | duration }}
            </p>
            <p class="status">{{ playbackState$ | async }}</p>
          </div>
        </div>

        <div class="player-controls">
          <div class="control-buttons">
            <button mat-icon-button (click)="audioService.playPrevious()">
              <mat-icon>skip_previous</mat-icon>
            </button>
            
            <button mat-icon-button class="play-button" (click)="togglePlay()">
              <mat-icon>{{ (isPlaying$ | async) ? 'pause' : 'play_arrow' }}</mat-icon>
            </button>
            
            <button mat-icon-button (click)="audioService.playNext()">
              <mat-icon>skip_next</mat-icon>
            </button>
          </div>

          <div class="playback-bar">
            <span class="time">{{ (currentTime$ | async) ?? 0 | duration }}</span>
            <mat-slider class="progress-slider" [max]="duration">
              <input matSliderThumb
                [value]="(currentTime$ | async) ?? 0"
                (valueChange)="seekTo($event)"
                (dragEnd)="onDragEnd($event)"
              >
            </mat-slider>
            <span class="time">{{ duration | duration }}</span>
          </div>
        </div>

        <div class="volume-control">
          <button mat-icon-button (click)="toggleMute()">
            <mat-icon>
              {{((volume$ | async) ?? 1) === 0 ? 'volume_off' : 
                ((volume$ | async) ?? 1) < 0.5 ? 'volume_down' : 'volume_up'}}
            </mat-icon>
          </button>
          <mat-slider class="volume-slider">
            <input matSliderThumb
              [min]="0"
              [max]="100"
              [step]="1"
              [value]="((volume$ | async) ?? 1) * 100"
              (valueChange)="setVolume($event)"
            >
          </mat-slider>
        </div>
      </ng-container>

      <ng-template #noTrack>
        <div class="empty-player">
          <mat-icon class="empty-icon">music_off</mat-icon>
          <p>No track selected</p>
          <small>Select a track from your library to start playing</small>
        </div>
      </ng-template>

      <!-- Progress Preview -->
      <div class="progress-preview" *ngIf="previewTime" [style.left.px]="previewPosition">
        {{ previewTime | duration }}
      </div>

      <!-- Queue Management -->
      <div class="queue-panel" *ngIf="showQueue">
        <h3>Next Up</h3>
        <div class="queue-list">
          <!-- Queue items -->
        </div>
      </div>

      <div *ngIf="error$ | async as error" class="error-message">
        {{ error }}
      </div>
      <div *ngIf="(loadingState$ | async) === 'loading'" class="loading-indicator">
        Loading...
      </div>
    </div>
  `,
  styles: [`
    .player-container {
      position: fixed;
      bottom: 48px; /* Height of footer */
      left: 0;
      right: 0;
      background: white;
      box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
      padding: 1rem;
      height: 90px;
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .now-playing {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 300px;
    }

    .now-playing img {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      object-fit: cover;
    }

    .track-info {
      overflow: hidden;
    }

    .track-info h3 {
      margin: 0;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .track-info p {
      margin: 4px 0 0;
      color: rgba(0,0,0,0.6);
      font-size: 0.9rem;
    }

    .player-controls {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .control-buttons {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .play-button {
      transform: scale(1.2);
    }

    .playback-bar {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .progress-slider {
      flex: 1;
    }

    .volume-control {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 200px;
    }

    .volume-slider {
      width: 100px;
    }

    .empty-player {
      width: 100%;
      text-align: center;
      color: rgba(0,0,0,0.6);
    }

    .empty-icon {
      font-size: 2rem;
      height: 2rem;
      width: 2rem;
      margin-bottom: 0.5rem;
    }

    .duration, .status {
      font-size: 0.8rem;
      color: rgba(0,0,0,0.6);
    }
    .status {
      text-transform: capitalize;
    }
  `]
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
    this.currentTrack$ = this.store.select(PlayerSelectors.selectCurrentTrack);
    this.isPlaying$ = this.store.select(PlayerSelectors.selectIsPlaying);
    this.currentTime$ = this.store.select(PlayerSelectors.selectCurrentTime);
    this.volume$ = this.store.select(PlayerSelectors.selectVolume);
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
  }
} 