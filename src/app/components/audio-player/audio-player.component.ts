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
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      background: linear-gradient(to bottom, #282828, #181818);
      color: white;
      height: 90px;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .now-playing {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 300px;
    }

    .now-playing img {
      width: 56px;
      height: 56px;
      border-radius: 4px;
      object-fit: cover;
    }

    .track-info h3 {
      margin: 0;
      font-size: 0.9rem;
      color: #fff;
    }

    .track-info p {
      margin: 4px 0 0;
      font-size: 0.8rem;
      color: #b3b3b3;
    }

    .player-controls {
      flex: 1;
      max-width: 722px;
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
      background: #fff;
      color: #000;
    }

    .play-button:hover {
      transform: scale(1.3);
    }

    .playback-bar {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .progress-slider {
      flex: 1;
    }

    .time {
      font-size: 0.7rem;
      color: #b3b3b3;
      min-width: 40px;
      text-align: center;
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

    ::ng-deep .mat-mdc-slider .mdc-slider__track--active {
      background-color: #1db954;
    }

    ::ng-deep .mat-mdc-slider .mdc-slider__thumb {
      background-color: #fff;
    }

    .empty-player {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #b3b3b3;
      padding: 1rem;
    }

    .empty-icon {
      font-size: 2rem;
      height: 2rem;
      width: 2rem;
      margin-bottom: 0.5rem;
    }

    .empty-player p {
      margin: 0;
      font-size: 1rem;
    }

    .empty-player small {
      margin-top: 0.25rem;
      font-size: 0.8rem;
      opacity: 0.8;
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