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
  selector: 'app-player',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatSliderModule,
    MatButtonModule,
    DurationPipe
  ],
  template: `
    <div class="player-container" *ngIf="currentTrack$ | async as track">
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
          <mat-slider class="progress-slider">
            <input matSliderThumb
              [min]="0"
              [max]="duration"
              [value]="(currentTime$ | async) ?? 0"
              (valueChange)="audioService.seek($event)"
            >
          </mat-slider>
          <span class="time">{{ duration | duration }}</span>
        </div>
      </div>

      <div class="extra-controls">
        <button mat-icon-button (click)="toggleShuffle()">
          <mat-icon [class.active]="shuffle$ | async">shuffle</mat-icon>
        </button>

        <button mat-icon-button (click)="toggleRepeat()">
          <mat-icon [class.active]="repeat$ | async">repeat</mat-icon>
        </button>

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

    .extra-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 300px;
      justify-content: flex-end;
    }

    .volume-slider {
      width: 100px;
    }

    mat-icon.active {
      color: #1db954;
    }

    ::ng-deep .mat-mdc-slider .mdc-slider__track--active {
      background-color: #1db954;
    }

    ::ng-deep .mat-mdc-slider .mdc-slider__thumb {
      background-color: #fff;
    }
  `]
})
export class PlayerComponent implements OnInit, OnDestroy {
  currentTrack$: Observable<Track | null>;
  isPlaying$: Observable<boolean>;
  currentTime$: Observable<number>;
  volume$: Observable<number>;
  shuffle$: Observable<boolean>;
  repeat$: Observable<boolean>;
  duration = 0;
  private destroy$ = new Subject<void>();
  private lastVolume = 1;

  constructor(
    private store: Store,
    public audioService: AudioService
  ) {
    this.currentTrack$ = this.store.select(PlayerSelectors.selectCurrentTrack);
    this.isPlaying$ = this.store.select(PlayerSelectors.selectIsPlaying);
    this.currentTime$ = this.store.select(PlayerSelectors.selectCurrentTime);
    this.volume$ = this.store.select(PlayerSelectors.selectVolume);
    this.shuffle$ = this.store.select(PlayerSelectors.selectShuffle);
    this.repeat$ = this.store.select(PlayerSelectors.selectRepeat);
  }

  ngOnInit() {
    // Subscribe to duration changes
    this.audioService.duration$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(duration => {
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

  toggleMute() {
    this.volume$.pipe(take(1)).subscribe(volume => {
      if (volume > 0) {
        this.lastVolume = volume;
        this.setVolume(0);
      } else {
        this.setVolume(this.lastVolume * 100);
      }
    });
  }

  setVolume(value: number) {
    this.audioService.setVolume(value / 100);
  }

  toggleShuffle() {
    this.store.dispatch(PlayerActions.toggleShuffle());
  }

  toggleRepeat() {
    this.store.dispatch(PlayerActions.toggleRepeat());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
} 